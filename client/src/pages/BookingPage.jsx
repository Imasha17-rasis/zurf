import React, { useState, useEffect } from 'react';
import { bookingAPI, paymentAPI } from '../services/api';
import { format } from 'date-fns';
import { FiCalendar, FiMapPin, FiClock, FiDollarSign, FiX, FiRefreshCw, FiDownload } from 'react-icons/fi';

const BookingPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved, completed, cancelled
  const [refreshing, setRefreshing] = useState(false);
  const [downloadingBookingId, setDownloadingBookingId] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingAPI.getMyBookings();
      setBookings(response.data.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const response = await bookingAPI.getMyBookings();
      setBookings(response.data.data);
    } catch (error) {
      console.error('Error refreshing bookings:', error);
      alert('Failed to refresh bookings. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await bookingAPI.cancel(bookingId);
      alert('Booking cancelled successfully');
      fetchBookings();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const handleDownloadReceipt = async (bookingId) => {
    try {
      setDownloadingBookingId(bookingId);
      const response = await paymentAPI.downloadReceipt(bookingId);
      
      // Create a blob URL and download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${bookingId.slice(-8)}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Receipt download error:', error);
      alert('Failed to download receipt. Please try again.');
    } finally {
      setDownloadingBookingId(null);
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

  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
            <p className="text-gray-600">View and manage your surf spot bookings</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-ocean-500 hover:bg-ocean-600 disabled:bg-gray-400 text-white font-medium rounded-lg transition"
            title="Refresh booking list and payment status"
          >
            <FiRefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-2 mb-6 flex flex-wrap gap-2">
          {['all', 'pending', 'approved', 'completed', 'cancelled'].map((status) => (
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

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg">No bookings found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
              >
                <div className="md:flex">
                  {/* Image */}
                  <div className="md:w-48 h-48 md:h-auto">
                    <img
                      src={booking.surfSpot?.images?.[0] || 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=300'}
                      alt={booking.surfSpot?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {booking.surfSpot?.name}
                        </h3>
                        <div className="flex items-center text-gray-600 text-sm">
                          <FiMapPin className="h-4 w-4 mr-1" />
                          {booking.surfSpot?.location?.city}, {booking.surfSpot?.location?.country}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>

                    {/* Booking Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center text-gray-700">
                        <FiCalendar className="h-5 w-5 mr-2 text-ocean-500" />
                        <div>
                          <p className="text-xs text-gray-500">Date</p>
                          <p className="font-medium">
                            {format(new Date(booking.bookingDate), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center text-gray-700">
                        <FiClock className="h-5 w-5 mr-2 text-ocean-500" />
                        <div>
                          <p className="text-xs text-gray-500">Time & Duration</p>
                          <p className="font-medium">
                            {booking.startTime} ({booking.durationHours}h)
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center text-gray-700">
                        <FiDollarSign className="h-5 w-5 mr-2 text-ocean-500" />
                        <div>
                          <p className="text-xs text-gray-500">Total Price</p>
                          <p className="font-medium text-lg text-ocean-600">
                            ${booking.totalPrice}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {booking.guide && booking.guide.user && (
                        <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                          <span>Guide: {booking.guide.user.name || `${booking.guide.user.firstName} ${booking.guide.user.lastName}`}</span>
                        </div>
                      )}
                      {booking.gears && booking.gears.length > 0 && (
                        <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                          <span>
                            Gear: {booking.gears.map((g, idx) => (
                              <span key={g.gear?._id || idx}>
                                {g.gear?.name}{g.quantity > 1 ? ` (×${g.quantity})` : ''}
                                {idx < booking.gears.length - 1 ? ', ' : ''}
                              </span>
                            ))}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-3">
                      {booking.paymentStatus === 'paid' && booking.status === 'approved' && (
                        <button
                          onClick={() => handleDownloadReceipt(booking._id)}
                          disabled={downloadingBookingId === booking._id}
                          className="flex items-center space-x-2 bg-ocean-500 hover:bg-ocean-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                          title="Download payment receipt as PDF"
                        >
                          <FiDownload className="h-4 w-4" />
                          <span>{downloadingBookingId === booking._id ? 'Downloading...' : 'Receipt'}</span>
                        </button>
                      )}
                      {booking.status === 'pending' && (
                        <button
                          onClick={() => handleCancelBooking(booking._id)}
                          className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                        >
                          <FiX className="h-4 w-4" />
                          <span>Cancel Booking</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;