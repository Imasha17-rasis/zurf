import React, { useState, useEffect } from 'react';
import { guideAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import { format } from 'date-fns';
import { FiCalendar, FiCheck, FiX, FiClock } from 'react-icons/fi';

const DashboardGuide = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const response = await guideAPI.getSchedule();
      setSchedule(response.data.data);
    } catch (error) {
      console.error('Error fetching schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptBooking = async (bookingId) => {
    try {
      await guideAPI.acceptBooking(bookingId);
      alert('Booking accepted successfully');
      fetchSchedule();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to accept booking');
    }
  };

  const handleRejectBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to reject this booking?')) {
      return;
    }

    try {
      await guideAPI.rejectBooking(bookingId);
      alert('Booking rejected');
      fetchSchedule();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to reject booking');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredSchedule = filter === 'all' 
    ? schedule 
    : schedule.filter(booking => booking.status === filter);

  if (loading) {
    return (
      <div className="flex">
        <Sidebar role="guide" />
        <div className="flex-1 flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="guide" />
      
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Guide Dashboard</h1>
            <p className="text-gray-600">Manage your bookings and schedule</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
                  <p className="text-3xl font-bold text-gray-900">{schedule.length}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <FiCalendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {schedule.filter(b => b.status === 'pending').length}
                  </p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <FiClock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Approved</p>
                  <p className="text-3xl font-bold text-green-600">
                    {schedule.filter(b => b.status === 'approved').length}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <FiCheck className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-lg shadow-sm p-2 mb-6 flex gap-2">
            {['all', 'pending', 'approved'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium capitalize transition ${
                  filter === status
                    ? 'bg-ocean-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Schedule List */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">My Schedule</h2>
            </div>

            {filteredSchedule.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-600">No bookings in your schedule</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredSchedule.map((booking) => (
                  <div key={booking._id} className="p-6 hover:bg-gray-50 transition">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {booking.surfSpot?.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          Surfer: {booking.surfer?.name}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <FiCalendar className="h-4 w-4 mr-1" />
                            {format(new Date(booking.bookingDate), 'MMM dd, yyyy')}
                          </div>
                          <div className="flex items-center">
                            <FiClock className="h-4 w-4 mr-1" />
                            {booking.startTime} ({booking.durationHours}h)
                          </div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>

                    {/* Actions for pending bookings */}
                    {booking.status === 'pending' && (
                      <div className="flex items-center space-x-3 mt-4">
                        <button
                          onClick={() => handleAcceptBooking(booking._id)}
                          className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                        >
                          <FiCheck className="h-4 w-4" />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => handleRejectBooking(booking._id)}
                          className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                        >
                          <FiX className="h-4 w-4" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardGuide;